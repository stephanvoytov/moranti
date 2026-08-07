# Ежедневный синк реальных цен Ozon (ozon-prices) в БД Moranti.
# Запускается Планировщиком Windows: daily 08:00 + при запуске компа.
# Защита от повторного запуска в один день — файл-маркер с датой последнего запуска.
$ErrorActionPreference = "Continue"

$root = "C:\Users\stepa\moranti"
$node = "C:\Program Files\nodejs\node.exe"
$marker = Join-Path $root "logs\ozon-prices-last-run.txt"
$log = Join-Path $root "logs\ozon-prices.log"
$today = Get-Date -Format "yyyy-MM-dd"

# Уже запускались сегодня? — выходим (защита от дублей при перезагрузках)
if (Test-Path $marker) {
    $last = (Get-Content $marker -Raw).Trim()
    if ($last -eq $today) {
        Add-Content $log "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] Пропуск: уже запускался сегодня ($today)" -Encoding UTF8
        exit 0
    }
}

Set-Location $root
Add-Content $log "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] === Запуск ozon-prices ===" -Encoding UTF8
& $node "scripts\sync-all.mjs" "--from-phase" "ozon-prices" *>> $log
$code = $LASTEXITCODE
Add-Content $log "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] === Завершено, код: $code ===" -Encoding UTF8

# Маркер ставим только после завершения (даже с ошибкой — чтобы не долбить при каждой перезагрузке)
$today | Set-Content $marker
exit $code