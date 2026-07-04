import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { RecoilRoot } from 'recoil';

import SettingDialog from './settings/settingDialog';
import { gpuState } from './atom/atom';
import { getDesignTokens } from './theme';

const renderSettingDialog = (gpuData = null) => {
  const theme = createTheme(getDesignTokens('dark'));

  return render(
    <RecoilRoot initializeState={({ set }) => set(gpuState, gpuData)}>
      <ThemeProvider theme={theme}>
        <SettingDialog />
      </ThemeProvider>
    </RecoilRoot>
  );
};

test('opens settings dialog even before gpu data is loaded', async () => {
  renderSettingDialog(null);

  userEvent.click(screen.getByRole('button', { name: /settings/i }));

  expect(await screen.findByRole('dialog')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /filter/i })).toBeInTheDocument();
});

test('opens settings dialog with gpu data', async () => {
  renderSettingDialog({
    madai: {
      basic_info: {
        gpu_name: 'NVIDIA H100 SXM5 80GB',
        cuda_versions: ['12.5'],
      },
      gpu_info: [
        {
          memory_total: '81559 MiB',
        },
      ],
    },
  });

  userEvent.click(screen.getByRole('button', { name: /settings/i }));

  expect(await screen.findByRole('dialog')).toBeInTheDocument();
  expect(screen.getByText('NVIDIA H100 SXM5 80GB')).toBeInTheDocument();
});
