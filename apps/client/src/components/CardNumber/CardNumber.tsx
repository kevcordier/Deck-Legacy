import { Text } from '@components/ui/Text/Text';
import { catalog } from '@helpers/catalog';
import { ExpansionIcon, cardNumber } from '@helpers/expansionIcon';
import { useGame } from '@hooks/useGame';
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
