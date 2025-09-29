import { Module } from "@nestjs/common";
import { WskGateway } from "./wsk.gateway";
import { WskService } from "./wsk.service";

@Module({
    imports: [WskGateway],
    providers: [WskService, WskGateway],
    exports: [WskService]
})
export class WskModule {}