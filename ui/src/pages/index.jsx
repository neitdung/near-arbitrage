import * as React from 'react';
import { appStore, onAppMount} from '../state/app';
import {useContext, useEffect, useState} from "react";

export default function Index() {
    const [isFirstLoading, setIsFirstLoading] = useState(true);
    const { dispatch, state, update } = useContext(appStore);
    const { app, views, app: {tab, snack}, near, wallet, contractAccount, account, loading } = state;
    const onMount = () => {
        dispatch(onAppMount());
    };
    useEffect( () => {
        if (isFirstLoading) {
            setIsFirstLoading(false);
            onMount()
        }

    }, [isFirstLoading]);
    return (
        <>
            <div>Hello</div>
        </>
    );
}
