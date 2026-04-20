import { useSelector } from 'react-redux';
import { useGetHomepageQuery } from '../api/homeApi';
import { RootState } from '../store/store';

export const usePromoApplicable = (itemsId?: number | null) => {
  const userState = useSelector((state: RootState) => state.user);

  const { data: homeData } = useGetHomepageQuery(
    {
      menuType: userState.menuType,
      branch:
        userState.menuType === 'dine-in'
          ? (userState.branchTable?.split('.')?.[0]?.toLowerCase() ?? null)
          : userState.branchAlias,
      addressId: userState.addressId ?? null,
    },
    { skip: !userState.menuType }
  );

  if (!itemsId || !homeData?.user_promos) return false;

  return homeData.user_promos.some(promo => promo.item_ids?.includes(itemsId));
};
