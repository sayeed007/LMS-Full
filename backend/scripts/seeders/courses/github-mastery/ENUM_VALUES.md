# Valid Enum Values Reference

## Course Model Enums

### Category (Required)
Valid values:
- `"Development"`
- `"Business"`
- `"Finance"`
- `"IT & Software"`
- `"Office Productivity"`
- `"Personal Development"`
- `"Design"`
- `"Marketing"`
- `"Lifestyle"`
- `"Photography"`
- `"Health & Fitness"`
- `"Music"`
- `"Teaching & Academics"`

### Level (Required)
Valid values:
- `"Beginner"` ✅ (Note: Capitalized!)
- `"Intermediate"`
- `"Expert"`
- `"All Levels"`

### Language (Optional)
- Default: `"English"`
- Any string value accepted

### Currency (Optional)
- Default: `"USD"`
- Any string value accepted

## Content Type Enums

### Lesson Content Types
Valid values:
- `"text"`
- `"block"`
- `"video"`
- `"audio"`
- `"document"`
- `"quiz"`
- `"assignment"`

### Block Types (within Block content)
Valid values:
- `"text"`
- `"image"`
- `"video"`
- `"audio"`
- `"document"`

## Common Mistakes

❌ **Wrong:**
```json
{
  "category": "Technology & Development",
  "level": "beginner"
}
```

✅ **Correct:**
```json
{
  "category": "Development",
  "level": "Beginner"
}
```

## Notes

1. **Case Sensitivity:** Level values are case-sensitive. Use proper capitalization.
2. **Exact Match:** Category values must match exactly as listed above.
3. **Required Fields:** Both category and level are required when creating a course.
4. **Subcategory:** This is a free-text field, not an enum.
