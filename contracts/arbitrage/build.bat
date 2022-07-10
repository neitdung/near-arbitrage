@echo off

title Arbitrage build
cargo build --all --target wasm32-unknown-unknown --release
xcopy %CD%\target\wasm32-unknown-unknown\release\arbitrage.wasm %CD%\res /Y
pause
