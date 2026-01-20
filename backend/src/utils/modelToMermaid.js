const mongoose = require('mongoose');

/**
 * Extracts schema structure from registered Mongoose models
 * @returns {Object} Structured schema data
 */
const getSchemaData = () => {
    const models = mongoose.models;
    const data = {
        entities: [],
        relationships: []
    };

    const processedModels = new Set();
    const relationships = [];

    // Helper function to get a safe identifier
    const safeId = (name) => name.replace(/[^a-zA-Z0-9]/g, '_');

    // Helper function to map Mongoose types to ER types
    const getFieldType = (schemaType) => {
        const instance = schemaType.instance;

        if (schemaType.options && schemaType.options.ref) {
            return 'ObjectId';
        }

        switch (instance) {
            case 'String': return 'string';
            case 'Number': return 'number';
            case 'Boolean': return 'boolean';
            case 'Date': return 'date';
            case 'ObjectID': return 'ObjectId';
            case 'Array': return 'array';
            case 'Mixed': return 'object';
            case 'Map': return 'map';
            case 'Embedded': return 'object';
            default: return instance || 'unknown';
        }
    };

    // Process each model
    Object.keys(models).forEach(modelName => {
        const safeName = safeId(modelName);
        if (processedModels.has(safeName)) return;
        processedModels.add(safeName);

        const model = models[modelName];
        const schema = model.schema;

        const entity = {
            name: modelName,
            safeName: safeName,
            fields: []
        };

        // Add fields
        schema.eachPath((path, schemaType) => {
            // Skip internal fields
            if (path === '__v' || path === '_id') return;
            // Skip nested paths (handle top-level only for simplicity in ERD)
            if (path.includes('.')) return;

            const fieldType = getFieldType(schemaType);
            const safePath = safeId(path);
            const isRequired = schemaType.isRequired;
            const isUnique = !!schemaType.options?.unique;

            entity.fields.push({
                name: path,
                safeName: safePath,
                type: fieldType,
                required: isRequired,
                unique: isUnique
            });

            // Collect relationships for refs
            if (schemaType.options && schemaType.options.ref) {
                const targetModel = safeId(schemaType.options.ref);
                relationships.push({
                    from: safeName,
                    to: targetModel,
                    label: safePath,
                    cardinality: '||--o|',  // one to zero-or-one
                    type: 'ref'
                });
            } else if (schemaType.instance === 'Array' && schemaType.caster) {
                // Array of refs
                if (schemaType.caster.options && schemaType.caster.options.ref) {
                    const targetModel = safeId(schemaType.caster.options.ref);
                    relationships.push({
                        from: safeName,
                        to: targetModel,
                        label: safePath,
                        cardinality: '||--o{',  // one to many
                        type: 'arrayRef'
                    });
                }
            }
        });

        data.entities.push(entity);
    });

    // Filter relationships where target model exists
    data.relationships = relationships.filter(rel => processedModels.has(rel.to));

    return data;
};

/**
 * Converts registered Mongoose models to a Mermaid ER Diagram string
 * @returns {string} Mermaid diagram definition
 */
const generateMermaidERD = () => {
    const data = getSchemaData();
    let mermaid = 'erDiagram\n';

    data.entities.forEach(entity => {
        mermaid += `    ${entity.safeName} {\n`;
        entity.fields.forEach(field => {
            const constraint = field.required ? 'PK' : (field.unique ? 'UK' : '');
            mermaid += `        ${field.type} ${field.safeName} ${constraint}\n`;
        });
        mermaid += `    }\n`;
    });

    data.relationships.forEach(rel => {
        mermaid += `    ${rel.from} ${rel.cardinality} ${rel.to} : "${rel.label}"\n`;
    });

    return mermaid;
};

/**
 * Generates SQL DDL statements optimized for Draw.io Import
 * @returns {string} SQL DDL string
 */
const generateSQLDDL = () => {
    const data = getSchemaData();
    let sql = '-- SQL Dump for Draw.io Import\n';
    sql += '-- Generated using LMS ERD Tool\n\n';

    // Helper to map types to SQL-ish types for visualization
    const toSQLType = (type) => {
        switch (type) {
            case 'string': return 'VARCHAR(255)';
            case 'number': return 'INT';
            case 'boolean': return 'BOOLEAN';
            case 'date': return 'DATETIME';
            case 'ObjectId': return 'CHAR(24)'; // MongoDB ObjectId standard
            case 'array': return 'TEXT';       // JSON/Arrays as TEXT for SQL compatibility
            case 'object': return 'TEXT';
            default: return 'VARCHAR(255)';
        }
    };

    data.entities.forEach(entity => {
        sql += `CREATE TABLE ${entity.safeName} (\n`;
        sql += `    _id CHAR(24) PRIMARY KEY`;

        // Fields
        if (entity.fields.length > 0) {
            sql += ',\n';
            const lines = entity.fields.map(field => {
                let line = `    ${field.safeName} ${toSQLType(field.type)}`;
                if (field.required) line += ' NOT NULL';
                if (field.unique) line += ' UNIQUE';
                return line;
            });
            sql += lines.join(',\n');
        }

        // Inline Foreign Keys
        // Find relationships where this entity is the "from" side (child)
        const entityRels = data.relationships.filter(rel =>
            rel.from === entity.safeName && rel.type !== 'arrayRef'
        );

        if (entityRels.length > 0) {
            const fkLines = entityRels.map(rel => {
                // Note: Draw.io might require the FK column to be defined above already
                return `    FOREIGN KEY (${rel.label}) REFERENCES ${rel.to}(_id)`;
            });
            sql += ',\n' + fkLines.join(',\n');
        }

        sql += '\n);\n\n';
    });

    return sql;
};

module.exports = {
    generateMermaidERD,
    getSchemaData,
    generateSQLDDL
};
