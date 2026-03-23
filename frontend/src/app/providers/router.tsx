import { Navigate, Route, Routes } from 'react-router-dom';

import { AdDetailsPage } from '@/pages/ad-details-page/ui/ad-details-page';
import { AdEditPage } from '@/pages/ad-edit-page/ui/ad-edit-page';
import { AdsListPage } from '@/pages/ads-list-page/ui/ads-list-page';
import { NotFoundPage } from '@/pages/not-found-page/ui/not-found-page';
import { APP_ROUTES } from '@/shared/constants/routes';
import { AppShell } from '@/widgets/app-shell/ui/app-shell';

export const AppRouter = () => (
  <Routes>
    <Route element={<AppShell />}>
      <Route index element={<Navigate replace to={APP_ROUTES.adsList} />} />
      <Route path={APP_ROUTES.adsList} element={<AdsListPage />} />
      <Route path={APP_ROUTES.adDetails} element={<AdDetailsPage />} />
      <Route path={APP_ROUTES.adEdit} element={<AdEditPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Route>
  </Routes>
);
