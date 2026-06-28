# QA STATIC REPORT · IBERFIT V6.7 RC

## Resultado QA interna

```json
{
  "ok": true,
  "failures": [],
  "warnings": [],
  "checked": {
    "brand": true,
    "mock_lockdown": true,
    "cloudflare_routes": true,
    "feedback_contract": true,
    "checkin_contract": true,
    "security_contract": true,
    "version_alignment": true,
    "pwa_manifest": true,
    "xlsx_real_headers_row5": true,
    "server_probe_header_contract": true,
    "qa_secret_restore": true,
    "week_linked_checkin": true
  }
}
```

## STDERR

```text
Spreadsheet runtime warmup failed during python startup
Traceback (most recent call last):
  File "/tmp/tmp.yTcnQsZYiA/artifact_tool_v2-2.8.4/artifact_tool/patches/warm_spreadsheet_runtime_on_startup.py", line 26, in warm_spreadsheet_runtime_on_startup
  File "/tmp/tmp.yTcnQsZYiA/artifact_tool_v2-2.8.4/artifact_tool/spreadsheet_warmup.py", line 785, in warm_spreadsheet_runtime
  File "/tmp/tmp.yTcnQsZYiA/artifact_tool_v2-2.8.4/artifact_tool/spreadsheet_warmup.py", line 720, in _warm_feature_flows
  File "/tmp/tmp.yTcnQsZYiA/artifact_tool_v2-2.8.4/artifact_tool/spreadsheet_warmup.py", line 704, in _warm_collaboration_flows
  File "/tmp/tmp.yTcnQsZYiA/artifact_tool_v2-2.8.4/artifact_tool/generated/interface/models.py", line 30820, in hydrate_crdt_from_proto
  File "/tmp/tmp.yTcnQsZYiA/artifact_tool_v2-2.8.4/artifact_tool/rpc/remote.py", line 749, in __call__
  File "/tmp/tmp.yTcnQsZYiA/artifact_tool_v2-2.8.4/artifact_tool/rpc/client.py", line 150, in call
artifact_tool.rpc.client.RemoteError: hydrateCrdtFromProto requires an empty collaborative document.
```

## Sintaxis JavaScript

- `03_CLOUDFLARE_APP/src/app.js`: `True`
- `03_CLOUDFLARE_APP/src/api.js`: `True`
- `03_CLOUDFLARE_APP/src/config.js`: `True`
- `03_CLOUDFLARE_APP/functions/api/ibf.js`: `True`
