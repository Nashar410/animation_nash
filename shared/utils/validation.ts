
// shared/utils/validation.ts
import { Model3D, ValidationResult, ValidationError, ValidationWarning } from '../types/models';

export class ModelValidator {
    static validate(model: Model3D): ValidationResult {
        const errors: ValidationError[] = [];
        const warnings: ValidationWarning[] = [];

        // Check if model has meshes
        if (!model.meshes || model.meshes.length === 0) {
            errors.push({
                code: 'NO_MESHES',
                message: 'Model contains no meshes',
            });
        }

        // Check mesh integrity
        model.meshes.forEach((mesh, index) => {
            if (!mesh.vertices || mesh.vertices.length === 0) {
                errors.push({
                    code: 'INVALID_MESH',
                    message: `Mesh ${index} has no vertices`,
                    field: `meshes[${index}]`,
                });
            }

            if (!mesh.indices || mesh.indices.length === 0) {
                warnings.push({
                    code: 'NO_INDICES',
                    message: `Mesh ${index} has no indices`,
                    field: `meshes[${index}]`,
                });
            }
        });

        // Check animations
        if (model.animations && model.animations.length > 0) {
            model.animations.forEach((anim, index) => {
                if (anim.duration <= 0) {
                    errors.push({
                        code: 'INVALID_ANIMATION',
                        message: `Animation ${index} has invalid duration`,
                        field: `animations[${index}]`,
                    });
                }
            });
        }

        return {
            valid: errors.length === 0,
            errors,
            warnings,
        };
    }
}