import * as React from 'react';
import { useMemo } from 'react';
import { AutocompleteProps } from '@mui/material/Autocomplete/Autocomplete';
import {
  StyledAutocomplete,
  StyledAutocompleteProps,
} from './StyledAutocomplete';

export function ComboBoxInput<T, Required extends boolean>(
  props: Omit<StyledAutocompleteProps<T, false, Required, true>, 'onChange'> & {
    onValueChanged: (value: T | null | string) => void;
  },
) {
  const { onValueChanged, ...rest } = props;
  const onChange: AutocompleteProps<T, false, Required, true>['onChange'] =
    useMemo(
      () => (e, item) => {
        onValueChanged(item);
      },
      [onValueChanged],
    );
  return <StyledAutocomplete {...rest} onChange={onChange} freeSolo={true} />;
}
