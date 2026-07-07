from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session
import stripe
from app.core.config import settings
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User, SubscriptionTier

stripe.api_key = settings.stripe_secret_key

router = APIRouter(prefix="/subscriptions", tags=["Subscriptions"])


class CreateCheckoutResponse(BaseModel):
    url: str


@router.post("/create-checkout", response_model=CreateCheckoutResponse)
def create_checkout_session(current_user: User = Depends(get_current_user)):
    if not settings.stripe_secret_key:
        raise HTTPException(status_code=501, detail="Stripe not configured")

    try:
        checkout_session = stripe.checkout.Session.create(
            customer_email=current_user.email,
            payment_method_types=["card"],
            line_items=[{"price": settings.stripe_premium_price_id, "quantity": 1}],
            mode="subscription",
            success_url="http://localhost:5173/dashboard?session_id={CHECKOUT_SESSION_ID}",
            cancel_url="http://localhost:5173/pricing",
            metadata={"user_id": str(current_user.id)},
        )
        return CreateCheckoutResponse(url=checkout_session.url)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    if not settings.stripe_webhook_secret:
        raise HTTPException(status_code=501, detail="Stripe not configured")

    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, settings.stripe_webhook_secret)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        user_id = session["metadata"]["user_id"]
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            user.subscription_tier = SubscriptionTier.premium
            user.stripe_customer_id = session.get("customer")
            db.commit()

    return {"status": "ok"}


@router.get("/status")
def get_subscription_status(current_user: User = Depends(get_current_user)):
    return {
        "tier": current_user.subscription_tier.value,
        "is_premium": current_user.subscription_tier == SubscriptionTier.premium,
    }
