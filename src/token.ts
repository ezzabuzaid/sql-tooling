export enum TokenType {
  // Single-character tokens.
  SINGLE_CHAR = 1,
  COMMA = 2,
  LEFT_PAREN = 3,
  RIGHT_PAREN = 4,
  DOT = 5,
  SEMICOLON = 6,
  PLUS = 7,
  MINUS = 8,
  STAR = 9,
  SLASH = 10,
  MODULO = 11,

  // One or two character tokens.
  MAYBE_DOUBLE_CHAR = 300,
  BANG = 301,
  NOT_EQUAL = 302,
  EQUAL_EQUAL = 303,
  GREATER = 304,
  GREATER_EQUAL = 305,
  LESS = 306,
  LESS_EQUAL = 307,
  CONCAT = 308,

  // Literals.
  IDENTIFIER = 601,
  STRING = 602,
  NUMBER = 603,
  FALSE = 604,
  TRUE = 605,

  // Keywords.
  SELECT = 901,
  FROM = 902,
  AS = 903,
  BY = 904,
  ASC = 905,
  DESC = 906,
  WHERE = 907,
  LIKE = 908,
  ILIKE = 909,
  BETWEEN = 910,
  SIMILAR = 911,
  IN = 912,
  DISTINCT = 913,
  LIMIT = 914,
  OFFSET = 915,
  AND = 916,
  OR = 917,
  NOT = 918,
  NOT_BETWEEN = 919,
  IS_NOT = 920,
  NOT_ILIKE = 921,
  NOT_LIKE = 922,
  INSERT = 919,
  VALUES = 920,
  IS = 921,
  NULL = 922,
  ALL = 923,
  EXISTS = 924,
  JOIN = 925,
  CROSS = 926,
  CREATE = 927,
  TABLE = 928,
  INTEGER = 929,
  TEXT = 930,
  PRIMARY = 931,
  UNIQUE = 932,
  TEMP = 933,
  KEY = 934,
  CHECK = 935,
  DEFAULT = 936,
  BLOB = 937,
  REAL = 938,
  BOOL = 939,
  DATE = 940,
  UPDATE = 941,
  SET = 942,
  VIEW = 943,

  // Clauses
  ORDER = 1201,
  GROUP = 1202,
  HAVING = 1203,

  // Others
  EOF = -1,
}

export interface IToken<T extends TokenType> {
  type: T;
  lexeme: string;
  start?: number;
  end?: number;
  line?: number;
}
