from pydantic import BaseModel
from typing import Literal


CategoryType = Literal["income", "expense", "both"]


class CategoryBase(BaseModel):
    name: str
    icon: str = "tag"
    color: str = "#10b981"
    type: CategoryType


class CreateCategoryInput(CategoryBase):
    pass


class UpdateCategoryInput(BaseModel):
    name: str | None = None
    icon: str | None = None
    color: str | None = None
    type: CategoryType | None = None


class Category(CategoryBase):
    id: str
    user_id: str | None  # null = categoria do sistema
    parent_id: str | None = None

    model_config = {"from_attributes": True}
