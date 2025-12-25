-- Check if CAD exists in Currency enum
SELECT unnest(enum_range(NULL::"Currency")) AS currency_value;










