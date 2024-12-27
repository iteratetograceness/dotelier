CREATE MIGRATION m1hvnmcbv53bemad2cxn4sxfohzuiycmlohd2a7gouvwktwjpudfza
    ONTO m1ax2at3ealvifubd6yfxp6d7ve3tf3ao24krhcr65k3qv56ihswya
{
  CREATE TYPE default::User {
      CREATE REQUIRED LINK identity: ext::auth::Identity {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE PROPERTY email: std::str;
      CREATE PROPERTY name: std::str;
  };
  ALTER TYPE default::Pixel {
      CREATE LINK owner: default::User;
  };
};
