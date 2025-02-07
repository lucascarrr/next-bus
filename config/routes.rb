Rails.application.routes.draw do
  get "next", to: "pages#next"

  get "next_bus/:day/:src/:dst", to: "pages#next"

  root "pages#home"
end
