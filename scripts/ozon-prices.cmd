@echo off
rem Ozon real prices (headless Chromium) — запуск с рабочей машины.
rem GitHub runner Variti блокирует заглушкой, поэтому фаза живёт здесь.
chcp 65001 >nul
cd /d C:\Users\stepa\moranti
if not exist logs mkdir logs
set OZON_HEADLESS=0
node scripts\sync-all.mjs --prices-only >> logs\ozon-prices.log 2>&1
