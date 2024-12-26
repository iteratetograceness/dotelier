CREATE MIGRATION m1vupkfumt4tivuh6rkqkt6vpuxnygq4mnessof3t74vf5ju45sypq
    ONTO m1efvc4o2eumawm4ddgtagoyh2ucqwjnw36sgnm2lscn422aorfpgq
{
  ALTER TYPE default::Pixel {
      CREATE PROPERTY style_id: std::str;
  };
};
