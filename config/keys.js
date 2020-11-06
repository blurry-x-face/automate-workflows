module.exports = {
  web: {
    client_id:
      "557779038727-vg6sgd3oovdqp2c5l7kuqie4mgro2fi4.apps.googleusercontent.com",
    project_id: "my-project-1548176585308",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_secret: "VPBGEI1NjOaNT-PrP7VZVY7g",
    redirect_uris: [
      "http://localhost:4000/google/callback",
      "http://localhost:4000/google",
    ],
    javascript_origins: ["http://localhost:4000", "https://localhost:4000"],
  },
  mongoURI:
    "mongodb+srv://blurry:AN7K5mgWqcCjstb3@cluster0.vxzn0.mongodb.net/auto?retryWrites=true&w=majority",
};
