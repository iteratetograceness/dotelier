CREATE MIGRATION m1efvc4o2eumawm4ddgtagoyh2ucqwjnw36sgnm2lscn422aorfpgq
    ONTO initial
{
  CREATE TYPE default::Category {
      CREATE REQUIRED PROPERTY name: std::str;
      CREATE REQUIRED PROPERTY slug: std::str;
  };
  CREATE TYPE default::Pixel {
      CREATE LINK category: default::Category;
      CREATE PROPERTY created_at: std::datetime;
      CREATE REQUIRED PROPERTY prompt: std::str;
      CREATE REQUIRED PROPERTY url: std::str;
  };
};
