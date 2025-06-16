// core/spritesheet-generator/layouts/LayoutFactory.ts
import { ILayout } from '@shared/interfaces';
import {GridLayout, LinearLayout, PackedLayout} from "@core/spritesheet-generator";
import {Layout} from "@shared/types/export.ts";


export class LayoutFactory {
    static create(layout: Layout): ILayout {
        switch (layout.type) {
            case 'grid':
                return new GridLayout({
                    columns: layout.columns,
                    rows: layout.rows,
                    spacing: layout.spacing,
                    padding: layout.padding,
                });

            case 'linear':
                return new LinearLayout({
                    direction: 'horizontal',
                    spacing: layout.spacing,
                    padding: layout.padding,
                });

            case 'packed':
                return new PackedLayout({
                    spacing: layout.spacing,
                    padding: layout.padding,
                    sortBy: 'area',
                });

            default:
                throw new Error(`Unknown layout type: ${layout.type}`);
        }
    }
}