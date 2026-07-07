from app.main import create_app


app = create_app()


def test_all_routes_registered():
    routes = [r.path for r in app.routes]
    expected = [
        "/api/v1/agent/invoke",
        "/api/v1/auth/signup",
        "/api/v1/auth/login",
        "/api/v1/auth/me",
        "/api/v1/export/resume",
        "/api/v1/export/cover-letter",
        "/api/v1/export/report",
        "/api/v1/health/",
        "/api/v1/resume/upload",
        "/api/v1/resume/analyze",
        "/api/v1/resume/upload-and-analyze",
        "/api/v1/resume/chat/",
        "/api/v1/stream/chat",
        "/api/v1/subscriptions/create-checkout",
        "/api/v1/subscriptions/webhook",
        "/api/v1/subscriptions/status",
        "/api/v1/dashboard",
        "/api/v1/history",
    ]
    for route in expected:
        assert route in routes, f"Missing route: {route}"


def test_health_route():
    matching = [r for r in app.routes if r.path == "/api/v1/health/"]
    assert len(matching) == 1
    assert "GET" in getattr(matching[0], "methods", {"GET"})


def test_agent_invoke_route():
    matching = [r for r in app.routes if r.path == "/api/v1/agent/invoke"]
    assert len(matching) == 1


def test_auth_routes_exist():
    paths = [r.path for r in app.routes]
    assert "/api/v1/auth/signup" in paths
    assert "/api/v1/auth/login" in paths
    assert "/api/v1/auth/me" in paths


def test_export_routes_exist():
    paths = [r.path for r in app.routes]
    assert "/api/v1/export/resume" in paths
    assert "/api/v1/export/cover-letter" in paths
    assert "/api/v1/export/report" in paths


def test_subscription_routes_exist():
    paths = [r.path for r in app.routes]
    assert "/api/v1/subscriptions/create-checkout" in paths
    assert "/api/v1/subscriptions/webhook" in paths
    assert "/api/v1/subscriptions/status" in paths


def test_stream_route_exists():
    paths = [r.path for r in app.routes]
    assert "/api/v1/stream/chat" in paths
