import { parserManager } from './index'
import { HybridApiParser } from './hybrid-api'
import { LocalApiParser } from './local-api'
import { DouyinDirectApiParser } from './douyin-direct-api'

// Register parsers according to config priority
parserManager.register(new DouyinDirectApiParser())   // 优先级 1
parserManager.register(new LocalApiParser())          // 优先级 2
parserManager.register(new HybridApiParser())         // 优先级 3

export { parserManager }