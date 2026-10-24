use axum::{
    http::{HeaderValue, Method},
    routing::{get, post},
    Json, Router,
};
use rig::{prelude::*, providers::ollama};
use rig::providers::ollama::Ollama;
use serde::{Deserialize, Serialize};
use tower_http::cors::CorsLayer;

#[derive(Deserialize)]
pub struct AskReq {
    pub prompt: String,
}

#[derive(Serialize)]
pub struct AskRes {
    pub answer: String,
}

#[derive(Serialize)]
pub struct HealthRes {
    pub status: &'static str,
    pub model: &'static str,
}

/// Healthcheck endpoint to verify backend status from frontend
async fn get_health() -> Json<HealthRes> {
    Json(HealthRes {
        status: "ok",
        model: "llama3.2", // matches ollama::LLAMA3_2
    })
}

/// Prompt handler: Receives request from React, builds the agent, and queries local Ollama
async fn handle_ask(Json(payload): Json<AskReq>) -> Json<AskRes> {
    let result = async {
        let client = Ollama::from_env()?;
        let agent = AgentBuilder::new(client.completion(ollama::LLAMA3_2))
            .preamble("You are a STEM tutor, using prompts, explain specific files/techniques")
            .build();

        let res = agent.prompt(payload.prompt).await?;
        Ok::<String, anyhow::Error>(res.to_string())
    }
    .await;

    let answer = match result {
        Ok(ans) => ans,
        Err(err) => format!("Error generating response from local engine: {}", err),
    };

    Json(AskRes { answer })
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Configure CORS so your React frontend (running on localhost:5173) can communicate with the server
    let cors = CorsLayer::new()
        .allow_origin("http://localhost:5173".parse::<HeaderValue>()?)
        .allow_methods([Method::GET, Method::POST])
        .allow_headers(tower_http::cors::Any);

    // Build Axum application router
    let app = Router::new()
        .route("/health", get(get_health))
        .route("/api/ask", post(handle_ask))
        .layer(cors);

    let addr = "127.0.0.1:3000";
    println!("⚡ Rust Open-Source AI Study Engine running on http://{}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}