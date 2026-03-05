import streamlit as st
import time
import plotly.graph_objects as go

# ==========================================
# 1. PAGE CONFIGURATION & STYLING
# ==========================================
st.set_page_config(
    page_title="PhishGuard AI | Threat Detection",
    page_icon="🛡️",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Custom CSS to make it look clinical and modern
st.markdown("""
    <style>
    .main { background-color: #0E1117; }
    .stTextInput input { border-radius: 8px; font-size: 16px; padding: 12px; }
    .stButton button { width: 100%; border-radius: 8px; font-weight: bold; }
    .metric-card { 
        background-color: #1E293B; 
        padding: 20px; 
        border-radius: 10px; 
        border-left: 5px solid #3B82F6; 
    }
    .threat-critical { border-left-color: #EF4444; }
    .threat-warning { border-left-color: #F59E0B; }
    .threat-safe { border-left-color: #10B981; }
    </style>
""", unsafe_allow_html=True)

# ==========================================
# 2. HELPER FUNCTIONS (Visuals)
# ==========================================
def create_threat_gauge(score):
    """Generates a gauge chart for the threat score."""
    color = "#10B981" if score < 40 else "#F59E0B" if score < 75 else "#EF4444"
    
    fig = go.Figure(go.Indicator(
        mode = "gauge+number",
        value = score,
        domain = {'x': [0, 1], 'y': [0, 1]},
        title = {'text': "Threat Score", 'font': {'size': 24}},
        gauge = {
            'axis': {'range': [None, 100], 'tickwidth': 1, 'tickcolor': "white"},
            'bar': {'color': color},
            'bgcolor': "rgba(0,0,0,0)",
            'borderwidth': 2,
            'bordercolor': "gray",
            'steps': [
                {'range': [0, 40], 'color': 'rgba(16, 185, 129, 0.2)'},
                {'range': [40, 75], 'color': 'rgba(245, 158, 11, 0.2)'},
                {'range': [75, 100], 'color': 'rgba(239, 68, 68, 0.2)'}],
        }
    ))
    fig.update_layout(height=300, margin=dict(l=20, r=20, t=50, b=20), paper_bgcolor="rgba(0,0,0,0)", font={'color': "white"})
    return fig

# ==========================================
# 3. MAIN APPLICATION LAYOUT
# ==========================================
st.title("🛡️ PhishGuard AI")
st.markdown("### Intelligent Multi-Agent Domain Analysis")
st.markdown("Detect suspicious look-alike domains using network analysis, content scraping, and visual AI.")

# The input section
col1, col2, col3 = st.columns([1, 2, 1])
with col2:
    st.markdown("<br>", unsafe_allow_html=True)
    url_input = st.text_input("Enter target URL for analysis:", placeholder="https://secure-login-paypal-verify.com")
    analyze_btn = st.button("Run Agentic Analysis", type="primary")

# ==========================================
# 4. EXECUTION & ANIMATION FLOW
# ==========================================
if analyze_btn and url_input:
    # 4A. Simulate the Agents working (The "Wow" factor for judges)
    with st.status("Initializing Cyber-Agents...", expanded=True) as status:
        st.write("🕵️‍♂️ **Lexical Agent:** Analyzing WHOIS data and Levenshtein distance...")
        time.sleep(1.5) # Replace with actual function call later
        
        st.write("📄 **Content Agent:** Scraping HTML for hidden forms and urgency keywords...")
        time.sleep(1.5) # Replace with actual function call later
        
        st.write("📸 **Visual Inspector:** Capturing headless screenshot and running Vision LLM...")
        time.sleep(2.0) # Replace with actual function call later
        
        st.write("🧠 **Lead Orchestrator:** Weighing evidence and generating final verdict...")
        time.sleep(1.5) # Replace with actual function call later
        
        status.update(label="Analysis Complete", state="complete", expanded=False)
    
    st.divider()

    # 4B. Render the Results Dashboard (Using Dummy Data)
    # TODO: Replace these hardcoded values with the output from your AI
    dummy_threat_score = 92
    dummy_verdict = "CRITICAL THREAT"
    dummy_explanation = "This domain mimics PayPal's login screen visually, but the WHOIS data shows it was registered 2 days ago in Iceland. The content contains hidden credential-harvesting forms."

    st.subheader(f"Analysis Results: {url_input}")
    
    # Top Row: Gauge and Summary
    res_col1, res_col2 = st.columns([1, 2])
    
    with res_col1:
        st.plotly_chart(create_threat_gauge(dummy_threat_score), use_container_width=True)
    
    with res_col2:
        st.markdown("### AI Orchestrator Summary")
        if dummy_threat_score > 75:
            st.error(f"**Verdict: {dummy_verdict}**")
        elif dummy_threat_score > 40:
            st.warning(f"**Verdict: SUSPICIOUS**")
        else:
            st.success(f"**Verdict: SAFE**")
            
        st.write(dummy_explanation)
        st.markdown("**Action Recommended:** Block domain at firewall level and issue user alerts.")

    st.markdown("<br>", unsafe_allow_html=True)

    # Bottom Row: Evidence Cards from the 3 Agents
    st.markdown("### Agent Evidence Breakdown")
    ev_col1, ev_col2, ev_col3 = st.columns(3)

    with ev_col1:
        st.markdown("""
        <div class="metric-card threat-critical">
            <h4>🌐 Lexical Analyst</h4>
            <p><b>Domain Age:</b> 2 Days</p>
            <p><b>Registrar:</b> Namecheap</p>
            <p><b>Pattern:</b> 'paypal' keyword stuffed, high Levenshtein distance from genuine.</p>
        </div>
        """, unsafe_allow_html=True)

    with ev_col2:
        st.markdown("""
        <div class="metric-card threat-critical">
            <h4>📄 Content Reviewer</h4>
            <p><b>Urgency Language:</b> Detected ("Verify immediately")</p>
            <p><b>Hidden Inputs:</b> 2 password fields detected</p>
            <p><b>External Links:</b> 0 links to actual paypal.com</p>
        </div>
        """, unsafe_allow_html=True)

    with ev_col3:
        st.markdown("""
        <div class="metric-card threat-critical">
            <h4>📸 Visual Inspector</h4>
            <p><b>Brand Spoofing:</b> High Confidence (PayPal Logo detected)</p>
            <p><b>Layout Match:</b> 89% structural similarity to genuine login.</p>
        </div>
        """, unsafe_allow_html=True)
        # Note: In the real version, use st.image("screenshot.png") here to show the capture!