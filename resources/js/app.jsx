import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { useEffect } from 'react';

const appName = import.meta.env.VITE_APP_NAME || 'Klik Kamera';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : `${appName}`),
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        const AppWithMidtrans = () => {
            useEffect(() => {
                const script = document.createElement('script');
                script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
                script.setAttribute('data-client-key', props.initialPage.props.clientKey || ''); 
                script.async = true;
                document.body.appendChild(script);

                return () => {
                    document.body.removeChild(script);
                };
            }, []);

            return <App {...props} />;
        };

        if (import.meta.env.SSR) {
            hydrateRoot(el, <AppWithMidtrans />);
            return;
        }

        createRoot(el).render(<AppWithMidtrans />);
    },
    progress: {
        color: '#4B5563',
    },
});