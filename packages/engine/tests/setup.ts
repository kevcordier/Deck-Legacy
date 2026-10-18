import { systemEnvironment } from '@engine/application/session/systemEnvironment';
import { environment } from '@engine/domain/environment/environment';

// Tests that build aggregates and strategies without a GameSession run with the real clock and ids.
environment.use(systemEnvironment);
