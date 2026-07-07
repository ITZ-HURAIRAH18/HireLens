"""initial migration

Revision ID: 001
Revises:
Create Date: 2026-07-07 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID


revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("email", sa.String(), unique=True, nullable=False, index=True),
        sa.Column("hashed_password", sa.String(), nullable=False),
        sa.Column("full_name", sa.String(), nullable=True),
        sa.Column("is_active", sa.Boolean(), default=True),
        sa.Column("subscription_tier", sa.Enum("free", "premium", name="subscriptiontier"), default="free"),
        sa.Column("stripe_customer_id", sa.String(), nullable=True),
        sa.Column("analyses_count", sa.Integer(), default=0),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
    )

    op.create_table(
        "job_applications",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("company_name", sa.String(), nullable=True),
        sa.Column("job_title", sa.String(), nullable=True),
        sa.Column("job_description", sa.Text(), nullable=True),
        sa.Column("match_score", sa.Integer(), nullable=True),
        sa.Column("status", sa.String(), default="draft"),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
    )

    op.create_table(
        "resumes",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("original_filename", sa.String(), nullable=False),
        sa.Column("file_path", sa.String(), nullable=True),
        sa.Column("resume_text", sa.Text(), nullable=True),
        sa.Column("parsed_data", sa.Text(), nullable=True),
        sa.Column("is_active", sa.Boolean(), default=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
    )

    op.create_table(
        "chat_sessions",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("resume_id", UUID(as_uuid=True), sa.ForeignKey("resumes.id"), nullable=True),
        sa.Column("agent_type", sa.String(), default="chat"),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
    )

    op.create_table(
        "analysis_results",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("resume_id", UUID(as_uuid=True), sa.ForeignKey("resumes.id"), nullable=False),
        sa.Column("analysis_type", sa.String(), nullable=False),
        sa.Column("result_data", sa.Text(), nullable=False),
        sa.Column("score", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
    )

    op.create_table(
        "resume_versions",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("resume_id", UUID(as_uuid=True), sa.ForeignKey("resumes.id"), nullable=False),
        sa.Column("version_name", sa.String(), nullable=True),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("is_tailored", sa.Boolean(), default=False),
        sa.Column("job_application_id", UUID(as_uuid=True), sa.ForeignKey("job_applications.id"), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
    )

    op.create_table(
        "chat_messages",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("session_id", UUID(as_uuid=True), sa.ForeignKey("chat_sessions.id"), nullable=False),
        sa.Column("role", sa.String(), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("agent_type", sa.String(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
    )


def downgrade() -> None:
    op.drop_table("chat_messages")
    op.drop_table("resume_versions")
    op.drop_table("analysis_results")
    op.drop_table("chat_sessions")
    op.drop_table("resumes")
    op.drop_table("job_applications")
    op.drop_table("users")
