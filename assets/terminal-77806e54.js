import"./modulepreload-polyfill-3cfb730f.js";

// Instant load - no typing animation
window.onload = function() {
    document.getElementById("title").innerHTML = "Welcome to torkay.com 👋";
    document.getElementById("subtitle").innerHTML = '==> Type "help" for available commands';
    document.getElementById("terminal").innerHTML = "user@localhost:~$";
    document.getElementById("terminal-input").focus();
};

document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("terminal-input");
    const terminalLine = document.querySelector(".terminal-line");
    const contentArea = document.querySelector(".window_content");

    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            const command = input.value.toLowerCase();
            const commandLine = document.createElement("div");
            const output = document.createElement("div");

            // Display the command that was entered
            commandLine.innerHTML = `<b>user@localhost:~$</b><span class="input-message">${command}</span>`;
            contentArea.insertBefore(commandLine, terminalLine);

            // Handle commands
            if (command === "help") {
                output.innerHTML = `<span class="a">Available Commands</span><br/>
    ==> about     - Learn about me<br/>
    ==> work      - Sorted Systems (digital consultancy)<br/>
    ==> projects  - View my portfolio<br/>
    ==> contact   - Get in touch<br/>
    ==> github    - Visit my GitHub<br/>
    ==> linkedin  - Connect on LinkedIn<br/>
    ==> status    - Current availability<br/>
    ==> help      - Show this menu`;
            }
            else if (command === "about") {
                output.innerHTML = `<span class="a">Torrin Kay</span><br/>
Software engineer and digital consultant based in Brisbane, Australia.<br/>
Focused on building practical solutions through software engineering and machine learning.<br/><br/>
<span class="a">Currently:</span> Running Sorted Systems, a digital software consultancy.`;
            }
            else if (command === "work") {
                const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
                output.innerHTML = "Opening Sorted Systems...";
                delay(500).then(() => {
                    window.location.href = "https://sortedsystems.com.au";
                });
            }
            else if (command === "projects" || command === "portfolio") {
                const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
                output.innerHTML = "Loading portfolio...";
                delay(500).then(() => {
                    window.location.href = "/portfolio";
                });
            }
            else if (command === "contact") {
                output.innerHTML = `<span class="a">Let's connect</span><br/>
    LinkedIn: <a href="https://www.linkedin.com/in/torrin-kay-b31876246/" target="_blank" class="a">linkedin.com/in/torrin-kay</a><br/>
    GitHub: <a href="https://github.com/torkay" target="_blank" class="a">github.com/torkay</a><br/><br/>
    Type <span class="a">linkedin</span> or <span class="a">github</span> to visit directly.`;
            }
            else if (command === "status") {
                output.innerHTML = `<span class="a">Current Status</span><br/>
    Availability: <span class="a">Open to consulting opportunities</span><br/>
    Location: Brisbane, Australia<br/>
    Focus: Software engineering, machine learning, digital solutions`;
            }
            else if (command === "github") {
                const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
                output.innerHTML = "Opening GitHub...";
                delay(500).then(() => {
                    window.location.href = "https://github.com/torkay";
                });
            }
            else if (command === "linkedin") {
                const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
                output.innerHTML = "Opening LinkedIn...";
                delay(500).then(() => {
                    window.location.href = "https://www.linkedin.com/in/torrin-kay-b31876246/";
                });
            }
            else if (command === "") {
                // Do nothing for empty command
            }
            else {
                output.innerHTML = `Command not found: <span class="a">${command}</span><br/>Type <span class="a">help</span> for available commands.`;
            }

            contentArea.insertBefore(output, terminalLine);
            input.value = "";
            e.preventDefault();
        }
    });
});

// Autosuggestion functionality
document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("terminal-input");
    const suggestionElement = document.getElementById("autosuggestion");
    const commands = ["help", "about", "work", "projects", "portfolio", "contact", "status", "github", "linkedin"];

    function updateSuggestion() {
        const currentInput = input.value.split(" ").pop();
        let suggestion = "";
        const padding = " ".repeat(currentInput.length);

        for (const cmd of commands) {
            if (cmd.startsWith(currentInput) && cmd !== currentInput) {
                suggestion = `${padding}${cmd.slice(currentInput.length)}`;
                break;
            }
        }

        suggestionElement.textContent = suggestion ? ` ${suggestion}` : "";
    }

    input.addEventListener("input", updateSuggestion);
});
