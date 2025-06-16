// core/model-loader/ModelLoader.ts
import { IModelLoader } from '@shared/interfaces';
import { Model3D, ValidationResult } from '@shared/types/models';
import {Logger} from "@shared/utils/logger.ts";
import {ModelValidator} from "@shared/utils/validation.ts";

export abstract class ModelLoader implements IModelLoader {
    protected logger: Logger;

    constructor(protected name: string) {
        this.logger = new Logger(`ModelLoader:${name}`);
    }

    abstract loadModel(file: File): Promise<Model3D>;
    abstract getSupportedFormats(): string[];

    validateModel(model: Model3D): ValidationResult {
        this.logger.info('Validating model', { id: model.id });
        return ModelValidator.validate(model);
    }

    dispose(): void {
        this.logger.debug('Disposing loader');
    }

    protected async readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as ArrayBuffer);
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsArrayBuffer(file);
        });
    }
}
