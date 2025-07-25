const words = [
    "Booting up... hang tight!",
    "Getting ready to chat.",
    "Warming up the engine...",
    "Polishing thoughts... please wait.",
    "First time? Almost ready.",
    "Loading smart thoughts.",
    "Tuning our thinking cap...",
    "Waking up the mind now.",
    "Setting up for a great chat.",
    "Getting into a creative mindset.",
    "Preparing your assistant.",
    "Clearing my throat... ready soon.",
    "Think of a cool question.",
    "Good things take a moment.",
    "Getting thoughts together... standby.",
    "Initiating protocols... loading.",
];

const loaderWidget = `
<div style="padding-right: 32px; padding-bottom: 32px; font-smooth: always; display: flex; flex-direction: column; align-items: end">
    Loading Application...
    <div id="words" style="font-size: 16px; opacity: 0.6; font-weight: 300; text-align: right; margin-top: 4px">
    ${words[Math.floor(Math.random() * words.length)]}
    </div>
</div>
`;

const shadcn_flutter_config = {
    loaderWidget: loaderWidget,
    backgroundColor: null,
    foregroundColor: null,
    loaderColor: null,
    fontFamily: 'Geist Sans',
    fontSize: '24px',
    fontWeight: '400',
    mainAxisAlignment: 'end',
    crossAxisAlignment: 'end',
    transitionDuration: 500,
    externalScripts: [
        {
            src: 'https://cdn.jsdelivr.net/npm/@fontsource/geist-sans@5.0.3/400.min.css',
            type: 'stylesheet',
        },
        {
            src: 'https://cdn.jsdelivr.net/npm/@fontsource/geist-sans@5.0.3/300.min.css',
            type: 'stylesheet',
        },
    ]
};

class ShadcnAppConfig {
    backgroundColor;
    foregroundColor;
    fontFamily;
    fontSize;
    fontWeight;
    mainAxisAlignment;
    crossAxisAlignment;
    loaderWidget;
    loaderColor;
    externalScripts;
    transitionDuration;

    constructor({ backgroundColor, foregroundColor, fontFamily, fontSize, fontWeight, mainAxisAlignment, crossAxisAlignment, loaderWidget, loaderColor, externalScripts, transitionDuration }) {
        this.backgroundColor = backgroundColor;
        this.foregroundColor = foregroundColor;
        this.fontFamily = fontFamily;
        this.fontSize = fontSize;
        this.fontWeight = fontWeight;
        this.mainAxisAlignment = mainAxisAlignment;
        this.crossAxisAlignment = crossAxisAlignment;
        this.loaderWidget = loaderWidget;
        this.loaderColor = loaderColor;
        this.externalScripts = externalScripts;

        if (this.backgroundColor == null) {
            this.backgroundColor = localStorage.getItem('shadcn_flutter.background') || '#09090b';
        }
        if (this.foregroundColor == null) {
            this.foregroundColor = localStorage.getItem('shadcn_flutter.foreground') || '#ffffff';
        }
        if (this.loaderColor == null) {
            this.loaderColor = localStorage.getItem('shadcn_flutter.primary') || '#3c83f6';
        }

        this.transitionDuration = transitionDuration || 0;
    }
}

class ShadcnAppThemeChangedEvent extends CustomEvent {
    constructor(theme) {
        super('shadcn_flutter_theme_changed', { detail: theme });
    }
}

class ShadcnAppTheme {
    background;
    foreground;
    primary;

    constructor(background, foreground, primary) {
        this.background = background;
        this.foreground = foreground;
        this.primary = primary;
    }
}

class ShadcnApp {
    config;

    constructor(config) {
        this.config = config;
    }

    loadApp() {
        this.#initializeDocument();
        this.#loadExternalScripts(0);
        window.addEventListener('shadcn_flutter_app_ready', () => this.onAppReady());
        window.addEventListener('shadcn_flutter_theme_changed', (event) => this.onThemeChanged(event));
        if (globalThis.shadcnAppLoaded) {
            this.onAppReady();
        }
    }

    #loadExternalScripts(index, onDone) {
        if (index >= this.config.externalScripts.length) {
            if (onDone) {
                onDone();
            }
            return;
        }
        this.#loadScriptDynamically(this.config.externalScripts[index], () => {
            this.#loadExternalScripts(index + 1, onDone);
        });
    }

    #createStyleSheet(css, id) {
        if (id) {
            const existingStyle = document.getElementById(id);
            if (existingStyle) {
                existingStyle.remove();
            }
        }
        const style = document.createElement('style');
        if (id) {
            style.id = id;
        }
        style.appendChild(document.createTextNode(css));
        document.head.appendChild(style);
    }

    #loadScriptDynamically(src, callback) {
        if (typeof src === 'string') {
            src = { src: src, type: 'script' };
        }
        if (src.type === 'script') {
            const script = document.createElement('script');
            script.src = src.src;
            script.onload = callback;
            document.body.appendChild(script);
        } else if (src.type === 'module') {
            const script = document.createElement('script');
            script.type = 'module';
            script.src = src.src;
            script.onload = callback;
            document.body.appendChild(script);
        } else if (src.type === 'stylesheet') {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = src.src;
            link.onload = callback;
            document.head.appendChild(link);
        } else {
            throw new Error('Unknown type of file to load: ' + src);
        }
    }

    #initializeDocument() {
        const loaderStyle = `
            display: flex;
            justify-content: ${this.config.mainAxisAlignment};
            align-items: ${this.config.crossAxisAlignment};
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: ${this.config.backgroundColor};
            color: ${this.config.foregroundColor};
            z-index: 9998;
            font-family: ${this.config.fontFamily};
            font-size: ${this.config.fontSize};
            font-weight: ${this.config.fontWeight};
            text-align: center;
            transition: opacity ${this.config.transitionDuration}ms;
            opacity: 1;
            pointer-events: initial;
        `;

        const loaderBarCss = `
        .loader {
          height: 7px;
          background: repeating-linear-gradient(-45deg,${this.config.loaderColor} 0 15px,#000 0 20px) left/200% 100%;
          animation: l3 20s infinite linear;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 9999;
        }
        @keyframes l3 {
            100% {background-position:right}
        }`;

        const loaderDiv = document.createElement('div');
        loaderDiv.style.cssText = loaderStyle;
        loaderDiv.innerHTML = this.config.loaderWidget;

        document.body.appendChild(loaderDiv);

        document.body.style.backgroundColor = this.config.background;

        const loaderBarDiv = document.createElement('div');
        loaderBarDiv.className = 'loader';
        loaderDiv.appendChild(loaderBarDiv);

        this.#createStyleSheet(loaderBarCss, 'web-preloader-style');
    }

    onAppReady() {
        const loaderDiv = document.querySelector('div');
        if (!loaderDiv) {
            return;
        }
        loaderDiv.style.opacity = 0;
        loaderDiv.style.pointerEvents = 'none';

        setTimeout(() => {
            loaderDiv.remove();
        }, this.config.transitionDuration + 50);
    }

    onThemeChanged(event) {
        let theme = event.detail;
        let background = theme['background'];
        let foreground = theme['foreground'];
        let primary = theme['primary'];
        localStorage.setItem('shadcn_flutter.background', background);
        localStorage.setItem('shadcn_flutter.foreground', foreground);
        localStorage.setItem('shadcn_flutter.primary', primary);
    }
}

globalThis.ShadcnApp = ShadcnApp;
globalThis.ShadcnAppConfig = ShadcnAppConfig;
globalThis.ShadcnAppThemeChangedEvent = ShadcnAppThemeChangedEvent;
globalThis.ShadcnAppTheme = ShadcnAppTheme;

const shadcn_flutter = new ShadcnApp(new ShadcnAppConfig(shadcn_flutter_config));
document.addEventListener('DOMContentLoaded', () => {
    shadcn_flutter.loadApp();
});
