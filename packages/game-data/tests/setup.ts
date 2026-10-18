import { systemEnvironment } from '@deck-legacy/engine/application/session/systemEnvironment';
import { environment } from '@deck-legacy/engine/domain/environment/environment';

// Tests that drive `GameAggregate` without a GameSession run with the real clock and ids.
environment.use(systemEnvironment);
