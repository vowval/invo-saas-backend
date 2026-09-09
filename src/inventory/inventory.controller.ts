import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { InventoryService } from './inventory.service';

@Controller('inventory')
@UseGuards(JwtAuthGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('chemicals')
  createChemical(@Body() body: any, @Req() req: any) {
    return this.inventoryService.createChemical(body, req.user.companyId);
  }

  @Get('chemicals')
  listChemicals(@Req() req: any) {
    return this.inventoryService.listChemicals(req.user.companyId);
  }

  @Get('chemicals/low-stock')
  lowStock(@Req() req: any) {
    return this.inventoryService.lowStockChemicals(req.user.companyId);
  }

  @Post('chemicals/:id/purchase')
  purchase(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.inventoryService.recordPurchase(id, req.user.companyId, body.quantity, body.notes, body.unitCost);
  }

  @Post('chemicals/:id/adjustment')
  adjustment(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.inventoryService.recordAdjustment(id, req.user.companyId, body.quantity, body.notes);
  }

  @Post('chemicals/:id/wastage')
  wastage(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.inventoryService.recordWastage(id, req.user.companyId, body.quantity, body.notes);
  }

  @Get('chemicals/:id/transactions')
  transactions(@Param('id') id: string, @Req() req: any) {
    return this.inventoryService.listTransactions(id, req.user.companyId);
  }

  @Post('recipes')
  createRecipe(@Body() body: any, @Req() req: any) {
    return this.inventoryService.createRecipe(body, req.user.companyId);
  }

  @Get('recipes')
  listRecipes(@Req() req: any) {
    return this.inventoryService.listRecipes(req.user.companyId);
  }

  @Get('recipes/:id')
  getRecipe(@Param('id') id: string, @Req() req: any) {
    return this.inventoryService.getRecipeOrFail(id, req.user.companyId);
  }

  @Get('recipes/:id/requirement')
  requirement(@Param('id') id: string, @Query('inputQty') inputQty: string, @Req() req: any) {
    return this.inventoryService.previewRequirement(id, req.user.companyId, Number(inputQty));
  }
}
