# Ежедневный бэкап БД → data/products.json

## На VPS (Linux) — через cron

```bash
# Добавить в crontab:
# Запускать каждый день в 3:00
crontab -e
```

```
0 3 * * * cd /path/to/moranti && node scripts/backup-fallback.mjs >> logs/backup.log 2>&1
```

## Локально (Windows) — через Task Scheduler

```powershell
# Создать задачу в планировщике
$action = New-ScheduledTaskAction `
  -Execute "node" `
  -Argument "scripts/backup-fallback.mjs" `
  -WorkingDirectory "C:\Users\stepa\moranti"

$trigger = New-ScheduledTaskTrigger -Daily -At 03:00

Register-ScheduledTask `
  -TaskName "Moranti DB Backup" `
  -Action $action `
  -Trigger $trigger `
  -RunLevel Highest
```

---

Скрипт: `scripts/backup-fallback.mjs`
- Подключается к БД из `DATABASE_URL` (.env.local)
- Читает активные товары + категории + настройки
- Пишет `data/products.json` в формате, которые читает приложение
- Retry 3 раза при ошибке соединения
- Логи с таймстемпом
