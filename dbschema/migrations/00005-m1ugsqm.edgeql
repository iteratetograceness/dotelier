CREATE MIGRATION m1ugsqmn6a4p2it3sfv5g7phbltc467mod2ur3k3s6j2jh4wt6gdfa
    ONTO m1hvnmcbv53bemad2cxn4sxfohzuiycmlohd2a7gouvwktwjpudfza
{
  ALTER TYPE default::Pixel {
      CREATE INDEX ON ((.owner, .created_at));
  };
};
