module default {
    type Category {
        required name: str;
        required slug: str;
    }

    type Pixel {
        required prompt: str;
        required url: str;
        created_at: datetime;
        category: Category;
        style_id: str;
    }
}
