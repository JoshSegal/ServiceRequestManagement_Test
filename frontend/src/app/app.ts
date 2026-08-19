import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Avatar } from './ui/avatar/avatar';
import { FeatureIcon } from './ui/feature-icon/feature-icon';
import { ToastContainer } from './ui/toast/toast-container';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, Avatar, FeatureIcon, ToastContainer],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
