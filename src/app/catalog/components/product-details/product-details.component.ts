import { ChangeDetectionStrategy, Component, Inject, Self } from '@angular/core'
import { TuiDestroyService } from '@taiga-ui/cdk'
import { combineLatest, map, takeUntil } from 'rxjs'

import { CatalogFacade } from '../../catalog-store/services/catalog.facade'
import { CartFacade } from 'src/app/cart/cart-store/services/cart.facade'
import { propertyIsNotNullOrUndefined } from 'src/app/shared/helpers/propertyIsNotNullOrUndefined.helper'

@Component({
  selector: 'ec-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService],
})
export class ProductDetailsComponent {
  public productDetails$ = this.catalogFacade.productDetails$
  public productsInCart$ = this.cartFacade.productsInCart$
  public isCartLoading$ = this.cartFacade.isLoading$
  public productIds!: { productId: string; variantId: number }
  public isInCart!: boolean

  constructor(
    private catalogFacade: CatalogFacade,
    private cartFacade: CartFacade,
    @Self()
    @Inject(TuiDestroyService)
    private destroy$: TuiDestroyService,
  ) {
    combineLatest([this.productDetails$, this.productsInCart$])
      .pipe(map(([productDetails, productsInCart]) => ({ productDetails, productsInCart })))
      .pipe(
        takeUntil(this.destroy$),
        propertyIsNotNullOrUndefined('productDetails'),
        propertyIsNotNullOrUndefined('productsInCart'),
      )
      .subscribe(({ productDetails, productsInCart }) => {
        this.productIds = { productId: productDetails.id, variantId: productDetails.variantId }
        this.isInCart = productsInCart.some(product => product.productId === this.productIds.productId)
      })
  }

  public addToCart(): void {
    this.cartFacade.addProductToCart(this.productIds)
  }

  public removeFromCart(): void {
    this.cartFacade.removeProductFromCart(this.productIds)
  }
}
