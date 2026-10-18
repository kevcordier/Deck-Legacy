import { ExpansionIcon } from '@components/ExpansionIcon/ExpansionIcon';
import { Text } from '@components/ui/Text/Text';
import { cardNumber } from '@domain/card/cardNumber';
import { useGame } from '@hooks/useGame';
import { catalog } from '@infrastructure/catalog/catalog';
import { useTranslation } from 'react-i18next';

type CardNumberProps = {
  readonly instanceId: number;
  readonly className?: string;
  /** Size of the expansion logo, to match the text size. */
  readonly iconClassName?: string;
};

/** `#number` printed on a card, preceded by the logo of its expansion. */
export function CardNumber({
  instanceId,
  className = '',
  iconClassName = 'size-3',
}: CardNumberProps) {
  const { t } = useTranslation();
  const { gameState } = useGame();
  const { expansion, number } = cardNumber(
    instanceId,
    catalog.expansions,
    gameState?.instances[instanceId],
  );
  return (
    <Text className={className}>
      {expansion && (
        <ExpansionIcon
          expansion={expansion}
          className={iconClassName}
          alt={t(`campaign.expansions.${expansion}.title`)}
        />
      )}
      #{number}
    </Text>
  );
}
