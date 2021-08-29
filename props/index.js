
import BOOLEAN from './Boolean.js'
import DATE from './Date.js'
import DECIMAL from './Decimal.js'
import INTEGER from './Integer.js'
import STRING from './String.js'
import TEXT from './Text.js'
import REFERENCE from './Reference.js'
/**
 * @ignore
 */
const props = {
  Boolean: BOOLEAN,
  Date: DATE,
  Decimal: DECIMAL,
  Integer: INTEGER,
  String: STRING,
  Text: TEXT
}
/**
 * @ignore
 */
export const typesFoundInSchema = [
  INTEGER,
  BOOLEAN,
  DATE,
  DECIMAL,
  STRING,
  TEXT,
  REFERENCE
]
/**
 * @ignore
 */
export default props
