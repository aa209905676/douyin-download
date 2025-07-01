import { parserManager } from './index'
import { HybridApiParser } from './hybrid-api'
import { LocalApiParser } from './local-api'

// Register all parsers (按优先级顺序)
parserManager.register(new HybridApiParser())  // 优先级 1
parserManager.register(new LocalApiParser())   // 优先级 2

export { parserManager }