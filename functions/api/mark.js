// GitHub Pages Browser Version of Computing Revision Studio.
const MODEL_ID = "diffusiongemma-26b";
const API_BASE = "https://codiv.ai";

// Safely pull variables injected by GitHub Actions into window.ENV
const CODIV_API_KEY = window.ENV ? window.ENV.CODIV_API_KEY : '';
const ALLOW_SHARED_MARKING = window.ENV ? String(window.ENV.ALLOW_SHARED_MARKING) === "true" : true;
const ALLOWED_ORIGIN = window.ENV ? window.ENV.ALLOWED_ORIGIN : '';

// --- Navigation View Handler ---
window.showView = function(viewId) {
  // Hide all view panels
  const views = document.querySelectorAll('.view');
  views.forEach(view => {
    view.classList.remove('active');
  });

  // Deactivate all navigation buttons
  const navButtons = document.querySelectorAll('.navbtn');
  navButtons.forEach(btn => {
    btn.classList.remove('active');
  });

  // Show the selected view panel
  const targetView = document.getElementById(viewId);
  if (targetView) {
    targetView.classList.add('active');
  }

  // Find and activate the clicked navigation button
  const clickedBtn = Array.from(navButtons).find(btn => btn.getAttribute('onclick')?.includes(viewId));
  if (clickedBtn) {
    clickedBtn.classList.add('active');
  }
};

// Set up background hooks on load
document.addEventListener("DOMContentLoaded", () => {
  console.log("Computing Revision Studio Initialised.");
  
  // Set up red AI marking button click listeners
  const markButtons = document.querySelectorAll(".btn.red, button, #mark-btn"); 
  markButtons.forEach(button => {
    if (button.getAttribute('onclick') && button.getAttribute('onclick').includes('showView')) {
      // Do nothing, handled natively by HTML inline click attribute
    } else {
      button.addEventListener("click", handleMarkButtonClick);
    }
  });
});

// Handle AI Assessment Marking Request
async function handleMarkButtonClick(event) {
  event.preventDefault();
  
  if (!ALLOW_SHARED_MARKING) {
    alert("AI marking is not enabled for shared use yet.");
    return;
  }
  if (!CODIV_API_KEY) {
    alert("The Codiv API key has not been configured in GitHub Secrets yet.");
    return;
  }

  const answerTextArea = document.querySelector("textarea, .textarea, #user-answer");
  if (!answerTextArea) {
    alert("Could not find the answer text input field on this page.");
    return;
  }

  const promptText = answerTextArea.value.trim();
  if (!promptText) {
    alert("A marking prompt or answer is required before submitting.");
    return;
  }

  const originalButtonText = event.target.innerText;
  event.target.innerText = "Marking answer... Please wait...";
  event.target.disabled = true;

  try {
    const response = await fetch(`${API_BASE}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${CODIV_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: MODEL_ID,
        messages: [
          {
            role: "system",
            content: "You are a fair, encouraging Year 9 Computing exam-practice marker. Follow the marking instructions in the user's prompt. Give clear actionable feedback."
          },
          { role: "user", content: promptText }
        ],
        max_tokens: 2200
      })
    });

    const data = await response.json().catch(() => ({}));
    
    if (!response.ok) {
      alert(`Error: ${data?.error?.message || response.status}`);
      return;
    }

    const feedback = data?.choices?.[0]?.message?.content;
    const resultBox = document.querySelector(".answerbox, #feedback-output");
    if (resultBox) {
      resultBox.innerHTML = `<div style="padding:15px; border-left:4px solid var(--lime); background:var(--white); border-radius:8px; margin-top:15px;"><strong>AI Feedback:</strong><p>${feedback.trim()}</p></div>`;
    } else {
      alert(`Assessment Complete!\n\n${feedback.trim()}`);
    }

  } catch (err) {
    alert("Could not reach Codiv API servers.");
  } finally {
    event.target.innerText = originalButtonText;
    event.target.disabled = false;
  }
}
