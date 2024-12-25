import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TowerPickerProps {
  towers: Array<{ deviceId: string; name: string }>;
  selectedTower: string;
  onTowerChange: (towerId: string) => void;
}

export function TowerPicker({
  towers,
  selectedTower,
  onTowerChange,
}: TowerPickerProps) {
  return (
    <Select value={selectedTower} onValueChange={onTowerChange}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Vyberte věž" />
      </SelectTrigger>
      <SelectContent>
        {towers.map((tower) => (
          <SelectItem key={tower.deviceId} value={tower.deviceId}>
            {tower.deviceId}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
