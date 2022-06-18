import React from 'react';
import PropTypes from 'prop-types';
import Head from 'next/head';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CacheProvider } from '@emotion/react';
import theme from '../theme';
import createEmotionCache from '../createEmotionCache';
import ResponsiveAppBar from "src/components/layout/ResponsiveAppBar";
import "../public/static/css/style.css";
import favicon from "../public/static/favicon.ico";
const clientSideEmotionCache = createEmotionCache();
import { AppProvider } from '../state/app';
export default function MyApp(props) {
    const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;
    return (
        <CacheProvider value={emotionCache}>
            <Head>
                <meta name="viewport" content="initial-scale=1, width=device-width" />
                <link rel="shortcut icon" href={favicon.src} />
                <meta name={"title"} title={"NEAR Arbitrage"} />
                <title>NEAR Arbitrage</title>
            </Head>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <main>
                    <AppProvider>
                        <ResponsiveAppBar />
                        <Component {...pageProps} />
                    </AppProvider>
                </main>
            </ThemeProvider>
        </CacheProvider>
    );
}

MyApp.propTypes = {
    Component: PropTypes.elementType.isRequired,
    emotionCache: PropTypes.object,
    pageProps: PropTypes.object.isRequired,
};
