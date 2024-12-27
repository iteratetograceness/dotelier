using extension auth;

module default {
    type User {
        email: str;
        name: str;

        required identity: ext::auth::Identity {
            constraint exclusive;
        };
    }

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
        owner: User;
        index on ((.owner, .created_at));
    }
}
