var Config = module.exports = {
  port: process.env.PORT || 3000,

  jwtSecret: process.env.MV_JWT_SECRET || 'aeha8j4h20adn92k10nkav0sjf90sleicazvyi54j39jfqasfjk9',

  loggingConfig: {
    format: [
      "{{timestamp}} <{{title}}> {{message}}", //default format
      {
        error: "{{timestamp}} <{{title}}> {{message}} (in {{file}}:{{line}})\nCall Stack:\n{{stack}}" // error format
      }
    ],
    dateformat: "HH:MM:ss.L",
    preprocess: function (data) {
      data.title = data.title.toUpperCase();
    },
    level: 'debug'
  },

  firstHash: process.env.MV_FIRST_HASH || '9658CDA4F49EC960C8152292C5653FE3F996E8FE576EA9A3A2EAD6DA5788AB4E',

  //Time until token expires (in minutes)
  tokenExpiresIn: process.env.MV_TOKEN_EXPIRES_MIN || 60 * 24 * 14,

  //Allows only one logged in user at a time.
  enforceOneUser: process.env.MV_ENFORCE_ONE_USER || true,

  //Temporary Password Complexity for lost Passwords
  lostPasswordComplexity: process.env.MV_LOST_PASSWORD_COMPLEXITY || 2,

  //Temporary Password Expiration in Milliseconds
  tempPasswordExpires: process.env.MV_LOST_PASSWORD_EXPIRES || 3600000, //1 hour
};