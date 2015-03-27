require File.expand_path('../boot', __FILE__)

require "rails"
# Pick the frameworks you want:
require "active_model/railtie"
# require "active_record/railtie"
require "action_controller/railtie"
require "action_view/railtie"
require "action_mailer/railtie"
require "sprockets/railtie"
require "rails/test_unit/railtie"

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module ReactSupport
  class Application < Rails::Application
    config.middleware.use ::Heroku::Bouncer,
        oauth: { id: ENV["HEROKU_OAUTH_ID"],
                 secret: ENV["HEROKU_OAUTH_SECRET"]},
        secret: ENV["HEROKU_BOUNCER_SECRET"],
        expose_token: true
  end
end
