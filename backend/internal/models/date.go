package models

import (
	"database/sql/driver"
	"encoding/json"
	"fmt"
	"time"
)

// NullableDate handles nullable dates that can be JSON strings or SQL DATE types
type NullableDate struct {
	Time  time.Time
	Valid bool // Valid is true if Time is not NULL
}

// Scan implements the sql.Scanner interface for database reads
func (nd *NullableDate) Scan(value interface{}) error {
	if value == nil {
		nd.Time, nd.Valid = time.Time{}, false
		return nil
	}

	switch v := value.(type) {
	case time.Time:
		nd.Time, nd.Valid = v, true
		return nil
	case string:
		t, err := time.Parse("2006-01-02", v)
		if err != nil {
			return fmt.Errorf("cannot parse date string: %v", err)
		}
		nd.Time, nd.Valid = t, true
		return nil
	case []byte:
		t, err := time.Parse("2006-01-02", string(v))
		if err != nil {
			return fmt.Errorf("cannot parse date bytes: %v", err)
		}
		nd.Time, nd.Valid = t, true
		return nil
	default:
		return fmt.Errorf("cannot scan %T into NullableDate", value)
	}
}

// Value implements the driver.Valuer interface for database writes
func (nd NullableDate) Value() (driver.Value, error) {
	if !nd.Valid {
		return nil, nil
	}
	return nd.Time.Format("2006-01-02"), nil
}

// MarshalJSON implements the json.Marshaler interface
func (nd NullableDate) MarshalJSON() ([]byte, error) {
	if !nd.Valid {
		return json.Marshal(nil)
	}
	return json.Marshal(nd.Time.Format("2006-01-02"))
}

// UnmarshalJSON implements the json.Unmarshaler interface
func (nd *NullableDate) UnmarshalJSON(data []byte) error {
	var s *string
	if err := json.Unmarshal(data, &s); err != nil {
		return err
	}

	if s == nil || *s == "" {
		nd.Valid = false
		return nil
	}

	t, err := time.Parse("2006-01-02", *s)
	if err != nil {
		return fmt.Errorf("cannot parse date from JSON: %v", err)
	}

	nd.Time, nd.Valid = t, true
	return nil
}

// String returns the date as a string or empty string if null
func (nd NullableDate) String() string {
	if !nd.Valid {
		return ""
	}
	return nd.Time.Format("2006-01-02")
}

// IsNull returns true if the date is null
func (nd NullableDate) IsNull() bool {
	return !nd.Valid
}

// NewNullableDate creates a new NullableDate from a string
func NewNullableDate(s string) (*NullableDate, error) {
	if s == "" {
		return &NullableDate{Valid: false}, nil
	}

	t, err := time.Parse("2006-01-02", s)
	if err != nil {
		return nil, fmt.Errorf("invalid date format: %v", err)
	}

	return &NullableDate{Time: t, Valid: true}, nil
}

// NewNullableDateFromTime creates a new NullableDate from a time.Time
func NewNullableDateFromTime(t time.Time) *NullableDate {
	return &NullableDate{Time: t, Valid: true}
}

// NewNullNullableDate creates a new null NullableDate
func NewNullNullableDate() *NullableDate {
	return &NullableDate{Valid: false}
}
