import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', ...defaultTheme.fontFamily.sans],
                caveat: ['Caveat', 'cursive'],
            },
            colors: {
                primary: '#2D5D7C',
                secondary: '#FF9900',
                acccent: '#F0F0F0',
                dark: '#002239',
                thrid: '#4B4B4B',
            },
            
        },
        screens: {
            'minitab' : '600px',
            'md' : '800px',
            'laptop' : '1280px',
            'lg' : '1440px'
        }
    },

    plugins: [forms],
};
