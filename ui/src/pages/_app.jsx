import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Head from 'next/head';
import { CacheProvider } from '@emotion/react';
import createEmotionCache from '../createEmotionCache';
import AppBar from "src/components/layout/AppBar";
import favicon from "../public/static/favicon.ico";
const clientSideEmotionCache = createEmotionCache();
import { AppProvider } from '../state/app';
import { ChakraProvider } from '@chakra-ui/react';

export default function MyApp(props) {
    const [isFirstLoading, setIsFirstLoading] = useState(true);
    const [windowObj, setWindowObj] = useState(null);
    useEffect(() => {
        if (isFirstLoading) {
            setIsFirstLoading(false);
            setWindowObj(window);
        }

    }, [isFirstLoading, windowObj]);
    const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;
    return (
        <CacheProvider value={emotionCache}>
            <Head>
                <meta name="viewport" content="initial-scale=1, width=device-width" />
                <link rel="shortcut icon" href={favicon.src} />
                <meta name={"title"} title={"NEAR Arbitrage"} />
                <title>NEAR Arbitrage</title>
            </Head>
                <main>
                    {windowObj &&
                    <AppProvider>
                        <ChakraProvider>
                            <AppBar />
                            <Component {...pageProps} />
                        </ChakraProvider>
                    </AppProvider>}
                </main>
        </CacheProvider>
    );
}

MyApp.propTypes = {
    Component: PropTypes.elementType.isRequired,
    emotionCache: PropTypes.object,
    pageProps: PropTypes.object.isRequired,
};
