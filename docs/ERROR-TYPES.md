# Iron Disciple OS Error Types

**Phase:** 6.1.1.6.1  
**Module:** `src/core/errors.js`

## Purpose

The Error Types module defines the canonical error hierarchy for Iron Disciple OS. It standardizes the data carried by framework failures before later milestones add error codes, factories, registries, recovery policies, and execution orchestration.

## Runtime registration

```javascript
const ErrorTypes = IronDisciple.get("ErrorTypes");
```

The same module is available as `IronDisciple.errorTypes`.

## Base type

Every framework error inherits from `IronLifeError`, which itself inherits from the native JavaScript `Error` class.

Each instance contains:

- `id`
- `timestamp`
- `name`
- `message`
- `code`
- `module`
- `severity`
- `category`
- `metadata`
- `context`
- `recoverable`
- `retryCount`
- `traceId`
- `parentTraceId`
- sanitized `cause`
- `stack`
- module `version` and `build`

## Typed errors

- `InitializationError`
- `ConfigurationError`
- `ValidationError`
- `DependencyError`
- `ModuleError`
- `StateError`
- `PersistenceError`
- `SchedulerError`
- `PlannerError`
- `TimeoutError`
- `NetworkError`
- `InternalError`

## Example

```javascript
const Errors = IronDisciple.get("ErrorTypes");

throw new Errors.ValidationError("Weight must be greater than zero.", {
    module: "NutritionSystem",
    metadata: { field: "weight" },
    context: { received: -1 },
    traceId: "trace-123"
});
```

## Immutability

Metadata, context, causes, registries, and serialized representations are deeply frozen. `withRetryCount()` returns a new error instance rather than mutating the original.
