import BOOLEAN from './Boolean.js'
import DATE from './Date.js'
import DECIMAL from './Decimal.js'
import INTEGER from './Integer.js'
import STRING from './String.js'
import TEXT from './Text.js'
const props = {
  Boolean: BOOLEAN,
  Date: DATE,
  Decimal: DECIMAL,
  Integer: INTEGER,
  String: STRING,
  Text: TEXT
}
export const typesFoundInSchema = [
  INTEGER,
  BOOLEAN,
  DATE,
  DECIMAL,
  STRING,
  TEXT
]
export default props
